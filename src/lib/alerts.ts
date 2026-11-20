/**
 * SweetAlert2 wrappers. Imported lazily so the library never loads during SSR.
 */
type SwalModule = typeof import("sweetalert2");

let swal: Promise<SwalModule["default"]> | null = null;
const load = () => (swal ??= import("sweetalert2").then((m) => m.default));

const customClass = {
  popup: "solstice-popup",
  confirmButton: "solstice-confirm",
  cancelButton: "solstice-cancel",
};

export async function toastSuccess(title: string, text?: string) {
  const Swal = await load();
  await Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title,
    ...(text ? { text } : {}),
    showConfirmButton: false,
    timer: 2400,
    timerProgressBar: true,
    customClass,
  });
}

export async function alertSuccess(title: string, html?: string, confirmText = "Continue") {
  const Swal = await load();
  await Swal.fire({
    icon: "success",
    title,
    ...(html ? { html } : {}),
    confirmButtonText: confirmText,
    buttonsStyling: false,
    customClass,
  });
}

export async function alertWarning(title: string, text?: string) {
  const Swal = await load();
  await Swal.fire({
    icon: "warning",
    title,
    ...(text ? { text } : {}),
    confirmButtonText: "Got it",
    buttonsStyling: false,
    customClass,
  });
}

export async function confirmDanger(title: string, text: string, confirmText = "Delete") {
  const Swal = await load();
  const res = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Keep it",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: { ...customClass, confirmButton: "solstice-danger" },
  });
  return res.isConfirmed;
}

/** Two-button prompt; resolves true when the user picks the main action. */
export async function confirmAction(
  title: string,
  text: string,
  confirmText: string,
  cancelText = "Not now",
  icon: "info" | "success" | "question" = "info",
) {
  const Swal = await load();
  const res = await Swal.fire({
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    buttonsStyling: false,
    customClass,
  });
  return res.isConfirmed;
}
