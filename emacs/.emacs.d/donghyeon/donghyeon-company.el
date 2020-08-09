(require 'ensure-package)
(ensure-package 'company)
(require 'company)
(add-hook 'c++-mode-hook 'company-mode)
(add-hook 'c-mode-hook 'company-mode)
(add-hook 'emacs-lisp-mode-hook 'company-mode)

(provide 'donghyeon-company)
