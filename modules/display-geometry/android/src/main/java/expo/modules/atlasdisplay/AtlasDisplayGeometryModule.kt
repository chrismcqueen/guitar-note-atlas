package expo.modules.atlasdisplay

import android.os.Build
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import androidx.core.view.WindowInsetsCompat
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AtlasDisplayGeometryModule : Module() {
  private var observedView: View? = null
  private var previousGeometry: Map<String, Any>? = null
  private val layoutListener = ViewTreeObserver.OnGlobalLayoutListener { publishGeometry() }

  private fun rootView(): View? {
    val content = appContext.currentActivity?.findViewById<ViewGroup>(android.R.id.content)
    return content?.getChildAt(0) ?: content
  }

  private fun geometry(): Map<String, Any>? {
    val root = rootView() ?: return null
    val windowInsets = root.rootWindowInsets ?: return null
    if (root.width == 0 || root.height == 0) return null
    val density = root.resources.displayMetrics.density.toDouble()
    val location = IntArray(2)
    root.getLocationInWindow(location)
    val rects = mutableListOf<Map<String, Double>>()
    fun addRect(left: Int, top: Int, right: Int, bottom: Int) {
      val x = maxOf(left - location[0], 0)
      val y = maxOf(top - location[1], 0)
      val endX = minOf(right - location[0], root.width)
      val endY = minOf(bottom - location[1], root.height)
      if (endX > x && endY > y) rects.add(mapOf(
        "x" to x / density, "y" to y / density,
        "width" to (endX - x) / density, "height" to (endY - y) / density
      ))
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      windowInsets.displayCutout?.boundingRects?.forEach { addRect(it.left, it.top, it.right, it.bottom) }
    }
    // Include visible system bars, but not hidden status/navigation bars.
    val bars = WindowInsetsCompat.toWindowInsetsCompat(windowInsets, root)
      .getInsets(WindowInsetsCompat.Type.systemBars())
    val decor = appContext.currentActivity?.window?.decorView ?: root
    if (bars.left > 0) addRect(0, 0, bars.left, decor.height)
    if (bars.top > 0) addRect(0, 0, decor.width, bars.top)
    if (bars.right > 0) addRect(decor.width - bars.right, 0, decor.width, decor.height)
    if (bars.bottom > 0) addRect(0, decor.height - bars.bottom, decor.width, decor.height)
    return mapOf("width" to root.width / density, "height" to root.height / density, "rects" to rects)
  }

  private fun publishGeometry() {
    val next = geometry() ?: return
    if (next != previousGeometry) {
      previousGeometry = next
      sendEvent("onGeometryChanged", next)
    }
  }

  private fun stopObserving() {
    observedView?.viewTreeObserver?.takeIf { it.isAlive }?.removeOnGlobalLayoutListener(layoutListener)
    observedView = null
    previousGeometry = null
  }

  override fun definition() = ModuleDefinition {
    Name("AtlasDisplayGeometry")
    Events("onGeometryChanged")
    AsyncFunction("getGeometry") { geometry() }.runOnQueue(Queues.MAIN)
    OnStartObserving {
      appContext.currentActivity?.runOnUiThread {
        stopObserving()
        observedView = rootView()
        observedView?.viewTreeObserver?.addOnGlobalLayoutListener(layoutListener)
        publishGeometry()
      }
    }
    OnStopObserving { appContext.currentActivity?.runOnUiThread { stopObserving() } }
    OnDestroy { appContext.currentActivity?.runOnUiThread { stopObserving() } }
  }
}
