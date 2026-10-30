import ExpoModulesCore
import UIKit

// Observe the actual app window as Duo moves between displays. UIKit handles
// the resize; no splash cover, replacement window or React remount is needed.
private final class DisplayObserver: UIView {
  var changed: (([String: Any]) -> Void)?
  private var previousSize: CGSize?

  override init(frame: CGRect) {
    super.init(frame: frame)
    autoresizingMask = [.flexibleWidth, .flexibleHeight]
    isUserInteractionEnabled = false
    accessibilityElementsHidden = true
  }
  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

  var geometry: [String: Any] {
    ["width": bounds.width, "height": bounds.height]
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    guard window != nil, bounds.width > 0, bounds.height > 0, previousSize != bounds.size else { return }
    previousSize = bounds.size
    changed?(geometry)
  }
}

public class AtlasDisplayGeometryModule: Module {
  private var observer: DisplayObserver?
  private var keyNotification: NSObjectProtocol?

  private func attach() {
    guard let host = appContext?.utilities?.currentViewController()?.view.window else { return }
    if observer?.window === host { return }
    observer?.removeFromSuperview()
    let view = DisplayObserver(frame: host.bounds)
    view.changed = { [weak self] value in self?.sendEvent("onGeometryChanged", value) }
    observer = view
    host.addSubview(view)
    view.setNeedsLayout()
    view.layoutIfNeeded()
  }

  public func definition() -> ModuleDefinition {
    Name("AtlasDisplayGeometry")
    Events("onGeometryChanged")
    AsyncFunction("getGeometry") { () -> [String: Any]? in
      self.attach()
      return self.observer?.geometry
    }.runOnQueue(.main)
    OnCreate {
      self.keyNotification = NotificationCenter.default.addObserver(
        forName: UIWindow.didBecomeKeyNotification, object: nil, queue: .main
      ) { [weak self] _ in self?.attach() }
    }
    OnAppEntersForeground { DispatchQueue.main.async { self.attach() } }
    OnDestroy {
      if let token = self.keyNotification { NotificationCenter.default.removeObserver(token) }
      DispatchQueue.main.async { self.observer?.removeFromSuperview(); self.observer = nil }
    }
  }
}
