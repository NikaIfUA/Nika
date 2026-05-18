export function generateEmailHTML(data: {
  subject: string;
  description: string;
  email: string;
  source?: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f8f8;">
      <!-- Header with logo -->
      <div style="background: linear-gradient(135deg, #776aeeff 0%, #9c8ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="https://raw.githubusercontent.com/NikaIfUA/Nika/main/frontend/src/assets/logo.png" alt="NIKA Logo" style="width: 120px; height: auto; margin-bottom: 15px;"/>
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
          Нове повідомлення з контактної форми
        </h1>
      </div>
      
      <!-- Content -->
      <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="margin-bottom: 20px;">
          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0;">
            <strong style="color: #776aeeff; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Тема</strong>
            <p style="color: #333; margin: 8px 0 0 0; font-size: 16px;">${data.subject}</p>
          </div>
          
          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0;">
            <strong style="color: #776aeeff; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Звідки дізнались</strong>
            <p style="color: #333; margin: 8px 0 0 0; font-size: 16px;">${data.source || "Не вказано"}</p>
          </div>
          
          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0;">
            <strong style="color: #776aeeff; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Email відправника</strong>
            <p style="margin: 8px 0 0 0;">
              <a href="mailto:${data.email}" style="color: #776aeeff; text-decoration: none; font-size: 16px; font-weight: 500;">${data.email}</a>
            </p>
          </div>
          
          <div style="margin-bottom: 0;">
            <strong style="color: #776aeeff; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 12px;">Повідомлення</strong>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #776aeeff;">
              <p style="color: #333; margin: 0; font-size: 15px; line-height: 1.6;">
                ${data.description.replace(/\n/g, "<br/>")}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p style="margin: 0;">Це повідомлення було відправлено з контактної форми сайту NIKA</p>
        <p style="margin: 5px 0 0 0; color: #ccc;">© 2025 NIKA. Всі права захищені.</p>
      </div>
    </div>
  `;
}

export function generateEmailText(data: {
  subject: string;
  description: string;
  email: string;
  source?: string;
}): string {
  return `
Тема: ${data.subject}
Звідки дізнались: ${data.source || "Не вказано"}
Email відправника: ${data.email}

Повідомлення:
${data.description}
  `;
}
