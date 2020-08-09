(require 'ensure-package)

;; Color Theme
(load-theme 'deeper-blue)

;; Use system font.
(defconst donghyeon-fonts
  '("Hack-11"
    "Ubuntu Mono-11"))
(let ((fontset-name (create-fontset-from-fontset-spec
                     standard-fontset-spec)))
  (dolist (f (reverse donghyeon-fonts))
    (let ((fs (find-font (font-spec :name f))))
      (when fs
        (set-fontset-font fontset-name
                          'unicode
                          (font-spec :name f)
                          nil
                          'prepend))))
  (add-to-list 'default-frame-alist
               `(font . ,fontset-name)))

;; Disable welcome screen.
(setq inhibit-startup-screen t)

;; Show line numbers.
(global-display-line-numbers-mode)

;; Do not show scrollbars.
(scroll-bar-mode -1)

;; Mode line configuration.
(line-number-mode)
(column-number-mode)

;; Disable use of tab characters.
(setq-default indent-tabs-mode nil)

;;; Nyan
(ensure-package 'nyan-mode)
(require 'nyan-mode)
(nyan-mode 1)
(setq nyan-animate-nyancat nil)
(setq nyan-bar-length 20)

;; Adjust mouse scrolling.
(setq mouse-wheel-scroll-amount '(3 ((shift) . 1) ((control) . nil)))
(setq mouse-wheel-progressive-speed nil)

;; Cursor blinking behaviour.
(setq blink-cursor-blinks 0)
(setq blink-cursor-interval 0.3)

;; Golden Ratio Scroll Screen
(ensure-package 'golden-ratio-scroll-screen)
(require 'golden-ratio-scroll-screen)
(global-set-key [remap scroll-down-command] 'golden-ratio-scroll-screen-down)
(global-set-key [remap scroll-up-command] 'golden-ratio-scroll-screen-up)

(provide 'donghyeon-look-and-feel)
