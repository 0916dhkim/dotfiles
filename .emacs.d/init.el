;; Packages.
(require 'package)
(add-to-list 'package-archives '("melpa" . "https://melpa.org/packages/"))
(package-initialize)
(defun ensure-package (package)
  "Ensure that PACKAGE is installed."
  (unless (package-installed-p package)
    (package-refresh-contents)
    (package-install package)))

;; Load Init modules.
(defun load-init-module (name)
  "Load a init module name NAME."
  (load (expand-file-name name user-emacs-directory)))

;;; Look & Feel.
(load-init-module "donghyeon-look-and-feel")

;;; Backup behaviour configuration.
(load-init-module "donghyeon-backup")

;;; Dired
(load-init-module "donghyeon-dired")

;; Emacs Lisp
(load-init-module "donghyeon-emacs-lisp")

;; CMake Project
(load-init-module "cmakeproject-mode")
(add-hook 'c++-mode-hook 'cmakeproject-mode)

;; Company
(ensure-package 'company)
(require 'company)
(add-hook 'c++-mode-hook 'company-mode)
(add-hook 'c-mode-hook 'company-mode)
(add-hook 'emacs-lisp-mode-hook 'company-mode)

;;; Flycheck
(ensure-package 'flycheck)
(require 'flycheck)
(add-hook 'c++-mode-hook 'flycheck-mode)

;; Helm
;(load-init-module "donghyeon-helm")
;; Ivy
(load-init-module "donghyeon-ivy")

;; IBuffer
(load-init-module "donghyeon-ibuffer")

;; Irony
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

;;; Rainbow Delimiters
(ensure-package 'rainbow-delimiters)
(require 'rainbow-delimiters)
(add-hook 'emacs-lisp-mode-hook 'rainbow-delimiters-mode)

;; Projectile
(load-init-module "donghyeon-projectile")

;;; Custom
(setq custom-file (expand-file-name "custom.el" user-emacs-directory))
(load custom-file)
