export const welcomeUserTemplate = (name: string, year: number) => `
  <!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo</title>
</head>

<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif;">

  <!-- Container geral -->
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0; background-color:#f3f4f6;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#2563eb; padding:30px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px;">
                Bem-vindo à nossa plataforma 🎉
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px; color:#111827;">

              <h2 style="margin-top:0; font-size:20px;">
                Olá, ${name}👋
              </h2>

              <p style="font-size:16px; line-height:24px; color:#4b5563;">
                Obrigado por se registrar! Estamos muito felizes em ter você conosco.
              </p>

              <p style="font-size:16px; line-height:24px; color:#4b5563;">
                Sua conta foi criada com sucesso e já está pronta para uso.
              </p>

              <hr style="border:none; border-top:1px solid #e5e7eb; margin:30px 0;" />

              <p style="font-size:12px; color:#9ca3af;">
                Se você não criou esta conta, pode ignorar este e-mail com segurança.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#9ca3af;">
              © ${year} Sua Empresa. Todos os direitos reservados.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
