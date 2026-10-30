package expo.modules.atlasdisplay

import android.app.Activity
import android.graphics.Canvas
import android.graphics.Color
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import java.lang.ref.WeakReference

/** Covers the native display handoff until React has committed the new canvas. */
object FoldTransitionCover : SensorEventListener {
  private val handler = Handler(Looper.getMainLooper())
  private var activity = WeakReference<Activity>(null)
  private var sensorManager: SensorManager? = null
  private var folded: Boolean? = null
  private var tablet: Boolean? = null
  private var cover: View? = null
  var generation = 0
    private set
  val visible: Boolean get() = cover != null
  private val timeout = Runnable { removeCover() }

  fun attach(host: Activity) {
    detach()
    activity = WeakReference(host)
    tablet = isTablet(host)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      sensorManager = host.getSystemService(SensorManager::class.java)
      sensorManager?.getDefaultSensor(Sensor.TYPE_HINGE_ANGLE)?.let {
        sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
      }
    }
  }

  private fun isTablet(host: Activity): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return host.resources.configuration.smallestScreenWidthDp >= 600
    val bounds = host.windowManager.maximumWindowMetrics.bounds
    return minOf(bounds.width(), bounds.height()) / host.resources.displayMetrics.density >= 600
  }

  fun configurationChanging(host: Activity) {
    val next = isTablet(host)
    if (tablet != null && tablet != next) showCover(host)
    tablet = next
  }

  private fun showCover(host: Activity) {
    generation += 1
    val content = host.findViewById<ViewGroup>(android.R.id.content) ?: return
    if (cover == null) {
      cover = object : View(host) {
        private val logo = host.getDrawable(R.drawable.atlas_transition_title)
        init { setBackgroundColor(Color.rgb(62, 105, 175)); isClickable = true }
        override fun onDraw(canvas: Canvas) {
          super.onDraw(canvas)
          // Match the phone's rotated shell; the tablet splash stays upright.
          val rotate = !isTablet(host) && height > width
          val w = if (rotate) height.toFloat() else width.toFloat()
          val h = if (rotate) width.toFloat() else height.toFloat()
          val scale = minOf(w * 0.72f / 2087.883f, h * 0.5f / 559.549f)
          canvas.save()
          canvas.translate(width / 2f, height / 2f)
          if (rotate) canvas.rotate(90f)
          canvas.scale(scale, scale)
          canvas.translate(-2087.883f / 2f, -559.549f / 2f)
          logo?.setBounds(0, 0, 2088, 560)
          logo?.draw(canvas)
          canvas.restore()
        }
      }
      content.addView(cover, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    }
    cover?.bringToFront()
    cover?.invalidate()
    handler.removeCallbacks(timeout)
    // A hinge may cross its threshold without switching displays. Never trap
    // the user behind a cover if no configuration/React acknowledgement follows.
    handler.postDelayed(timeout, 1500)
  }

  fun complete(id: Int, width: Double, height: Double) {
    val host = activity.get() ?: return
    val content = host.findViewById<ViewGroup>(android.R.id.content) ?: return
    val density = host.resources.displayMetrics.density
    if (id == generation && kotlin.math.abs(content.width / density - width) < 2 &&
        kotlin.math.abs(content.height / density - height) < 2) {
      // Let the acknowledged React commit reach the render thread first.
      content.postOnAnimation { content.postOnAnimation { if (id == generation) removeCover() } }
    }
  }

  private fun removeCover() {
    handler.removeCallbacks(timeout)
    (cover?.parent as? ViewGroup)?.removeView(cover)
    cover = null
  }

  fun detach() {
    sensorManager?.unregisterListener(this)
    sensorManager = null
    folded = null
    tablet = null
    removeCover()
    activity.clear()
  }

  override fun onSensorChanged(event: SensorEvent) {
    val next = event.values[0] <= 10f
    if (folded != null && folded != next) activity.get()?.let { showCover(it) }
    folded = next
  }
  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
