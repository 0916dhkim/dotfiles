(require 'ensure-package)
(ensure-package 'irony)
(ensure-package 'company-irony)
(ensure-package 'flycheck-irony)
(require 'irony)
(require 'company-irony)

(add-hook 'c++-mode-hook 'irony-mode)
(add-hook 'c-mode-hook 'irony-mode)
(eval-after-load 'company
  '(add-to-list 'company-backends 'company-irony))
(eval-after-load 'flycheck
  '(add-hook 'flycheck-mode-hook 'flycheck-irony-setup))

(provide 'donghyeon-irony)
