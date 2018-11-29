(require 'ensure-package)
(ensure-package 'rainbow-delimiters)
(require 'rainbow-delimiters)

;; Customize parentheses colors.
(set-face-foreground 'rainbow-delimiters-depth-1-face "orange")
(set-face-foreground 'rainbow-delimiters-depth-2-face "cyan")
(set-face-foreground 'rainbow-delimiters-depth-3-face "yellow")
(set-face-foreground 'rainbow-delimiters-depth-4-face "magenta")
(set-face-foreground 'rainbow-delimiters-depth-5-face "blue")
(set-face-foreground 'rainbow-delimiters-depth-6-face "dark violet")
(set-face-foreground 'rainbow-delimiters-depth-7-face "spring green")
(set-face-foreground 'rainbow-delimiters-depth-8-face "dodger blue")
(set-face-foreground 'rainbow-delimiters-depth-9-face "tomato")
(set-face-foreground 'rainbow-delimiters-mismatched-face "red")
(set-face-foreground 'rainbow-delimiters-unmatched-face "red")

;; Enable for elisp code.
(add-hook 'emacs-lisp-mode-hook 'rainbow-delimiters-mode)

(provide 'donghyeon-rainbow-delimiters)
