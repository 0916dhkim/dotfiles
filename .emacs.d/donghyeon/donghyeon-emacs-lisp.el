(add-hook 'emacs-lisp-mode-hook (lambda ()
                                  "Disable tab characters."
                                  (setq indent-tabs-mode nil)))

(provide 'donghyeon-emacs-lisp)
