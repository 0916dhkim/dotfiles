(ensure-package 'ivy)
(ensure-package 'counsel)
(ensure-package 'swiper)
(require 'ivy)

;; Remap default functions to ivy-version.
(define-key global-map [remap execute-extended-command] #'counsel-M-x)
(define-key global-map [remap describe-function] #'counsel-describe-function)
(define-key global-map [remap describe-variable] #'counsel-describe-variable)
(define-key global-map [remap isearch-forward] #'swiper)

;; Customize.
(setq ivy-re-builders-alist
      '((t . ivy--regex-ignore-order)))

(ivy-mode 1)
