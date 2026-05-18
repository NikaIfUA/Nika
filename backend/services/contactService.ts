import { RouterContext } from "../dependencies.ts";
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_TO } from "../env.ts";
import nodemailer from "npm:nodemailer@^6.9.8";

interface ContactFormData {
  subject: string;
  description: string;
  email: string;
  source: string;
  html?: string;
  text?: string;
}

class ContactService {
  public static async sendContactEmail(
    context: RouterContext<string>
  ): Promise<void> {
    try {
      const body = context.request.body;
      
      if (body.type() !== "json") {
        context.response.status = 415;
        context.response.body = {
          error: "Request body must be application/json.",
        };
        return;
      }

      const formData: ContactFormData = await body.json();

      // Валідація
      if (!formData.subject || !formData.description || !formData.email) {
        context.response.status = 400;
        context.response.body = {
          error: "Subject, description, and email are required fields.",
        };
        return;
      }

      // Перевірка email формату
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        context.response.status = 400;
        context.response.body = { error: "Invalid email format." };
        return;
      }

      if (!EMAIL_TO) {
        context.response.status = 500;
        context.response.body = {
          error: "Email recipient is not configured on the server.",
        };
        return;
      }

      // Використовуємо HTML та text з frontend або генеруємо fallback
      const htmlContent = formData.html || `
        <div style="font-family: Arial, sans-serif;">
          <h2>Нове повідомлення з контактної форми</h2>
          <p><strong>Тема:</strong> ${formData.subject}</p>
          <p><strong>Звідки дізнались:</strong> ${formData.source || "Не вказано"}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Повідомлення:</strong><br/>${formData.description.replace(/\n/g, "<br/>")}</p>
        </div>
      `;

      const textContent = formData.text || `
Тема: ${formData.subject}
Звідки дізнались: ${formData.source || "Не вказано"}
Email відправника: ${formData.email}

Повідомлення:
${formData.description}
      `;

      // Create transporter with nodemailer
      const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: `"NIKA Contact Form" <${EMAIL_USER}>`,
        to: EMAIL_TO,
        replyTo: formData.email,
        subject: `Контактна форма: ${formData.subject}`,
        text: textContent,
        html: htmlContent,
      });

      console.log(`Email sent successfully: ${info.messageId}`);

      context.response.status = 200;
      context.response.body = {
        success: true,
        message: "Your message has been sent successfully!",
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending contact email:", error);
      context.response.status = 500;
      context.response.body = {
        error: "Failed to send email. Please try again later.",
      };
    }
  }
}

export default ContactService;
