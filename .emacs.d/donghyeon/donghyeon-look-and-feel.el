(require 'ensure-package)

;; Color Theme
(ensure-package 'monokai-theme)
(load-theme 'monokai t)

;; Use system font.
(add-to-list 'default-frame-alist
             '(font . "Hack-11"))

;; Disable welcome screen.
(setq inhibit-startup-screen t)

;; Show line numbers.
(global-display-line-numbers-mode)

;; Do not show scrollbars.
(scroll-bar-mode -1)

;; Mode line configuration.
(line-number-mode)
(column-number-mode)

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
