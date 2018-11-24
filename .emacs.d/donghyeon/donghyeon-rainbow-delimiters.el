(require 'ensure-package)
(ensure-package 'rainbow-delimiters)
(require 'rainbow-delimiters)

(add-hook 'emacs-lisp-mode-hook 'rainbow-delimiters-mode)

(provide 'donghyeon-rainbow-delimiters)
