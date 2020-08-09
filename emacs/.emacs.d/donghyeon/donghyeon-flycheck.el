(require 'ensure-package)
(ensure-package 'flycheck)
(require 'flycheck)
(add-hook 'c++-mode-hook 'flycheck-mode)
(add-hook 'emacs-lisp-mode 'flycheck-mode)

(provide 'donghyeon-flycheck)
