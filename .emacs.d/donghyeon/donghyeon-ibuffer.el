(require 'ibuffer)
;; Use IBuffer.
(define-key global-map [remap list-buffers]  #'ibuffer)

;; Do not prompt for deletion when not modified.
(setq ibuffer-expert t)

;; Do not show empty filter groups.
(setq ibuffer-show-empty-filter-groups nil)

;; Automatically refresh buffer list.
(add-hook 'ibuffer-mode-hook #'ibuffer-auto-mode)

;; Group buffers.
(add-hook 'ibuffer-mode-hook
          (lambda () (ibuffer-switch-to-saved-filter-groups "home")))
(setq ibuffer-saved-filter-groups
      '(("home"
         ("Source Code" (or (mode . c++-mode)
                            (mode . c-mode)
                            (mode . emacs-lisp-mode)))
         ("Git" (filename . ".gitignore"))
         ("Dired" (mode . dired-mode)))))

(provide 'donghyeon-ibuffer)
