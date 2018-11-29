(require 'package)
(defun ensure-package (package)
  "Ensure that PACKAGE is installed."
  (unless (package-installed-p package)
    (package-refresh-contents)
    (package-install package)
    (add-to-list 'package-selected-packages package))
  ;; Add to the selected packages list.
  (add-to-list 'package-selected-packages package))


(provide 'ensure-package)
