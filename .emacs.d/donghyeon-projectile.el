(ensure-package 'projectile)
(require 'projectile)

;; Use Ivy as completion engine if available.
(eval-after-load 'ivy
  (lambda () (setq projectile-completion-system 'ivy)))

;; Use current directory as project root
;; if there is no current project.
(setq projectile-require-project-root nil)

;; Remap default find-file function to projectile-file-file.
(define-key global-map [remap find-file] #'projectile-find-file)

(projectile-mode 1)
