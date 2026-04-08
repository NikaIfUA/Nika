import { Router } from "../dependencies.ts";
import ContactService from "../services/contactService.ts";

export default function contactRoutes(router: Router) {
  router.post("/api/contact", ContactService.sendContactEmail);
}
