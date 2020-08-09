(require 'ensure-package)
(ensure-package 'helm)
(require 'helm)
(require 'helm-config)

(helm-mode 1)

;; Take care of infamous helm tab issue.
(define-key helm-map (kbd "<tab>") #'helm-execute-persistent-action)
(define-key helm-map (kbd "M-x") #'helm-select-action)

;; Remap default functions to helm-version.
(define-key global-map [remap find-file] #'helm-find-files)
(define-key global-map [remap execute-extended-command] #'helm-M-x)

(provide 'donghyeon-helm)
