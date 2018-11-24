(require 'dired)
(require 'dired-x)

;; Hide file permissions.
(add-hook 'dired-mode-hook #'dired-hide-details-mode)

;; Always do dired-jump in a new window.
(global-set-key [remap dired-jump] #'dired-jump-other-window)

(defun dired-new-file (file)
  "Create new file at FILE."
  (interactive "GNew File Name: ")
  (if (file-exists-p file)
      (error "File already exists. Failed to create new file.")
    (with-temp-buffer (write-file file)))
  (revert-buffer))

(define-key dired-mode-map (kbd "c") #'dired-new-file)

(provide 'donghyeon-dired)
