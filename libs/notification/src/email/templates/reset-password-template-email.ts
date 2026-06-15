export const resetPasswordTemplate = (
  name: string,
  resetLink: string,
) => `
<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redefinição de Senha</title>
</head>

<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:12px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#2563eb; padding:32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:bold;">
                Redefinição de Senha
              </h1>
            </td>
          </tr>

          <!-- Conteúdo -->
          <tr>
            <td style="padding:40px;">

              <h2 style="margin-top:0; color:#111827; font-size:20px;">
                Olá, ${name} 👋
              </h2>

              <p style="font-size:16px; line-height:24px; color:#4b5563;">
                Recebemos uma solicitação para redefinir a senha da sua conta.
              </p>

              <p style="font-size:16px; line-height:24px; color:#4b5563;">
                Para criar uma nova senha, clique no botão abaixo. Você será direcionado para uma página segura onde poderá definir sua nova senha.
              </p>

              <!-- Botão -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:32px 0;">
                <tr>
                  <td align="center" bgcolor="#2563eb" style="border-radius:8px;">
                    <a href="${resetLink}"
                      target="_blank"
                      style="
                        display:inline-block;
                        padding:14px 32px;
                        color:#ffffff;
                        text-decoration:none;
                        font-size:16px;
                        font-weight:bold;
                      ">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px; line-height:22px; color:#6b7280;">
                Este link é válido por <strong>15 minutos</strong> e poderá ser utilizado apenas uma vez por motivos de segurança.
              </p>

              <p style="font-size:14px; line-height:22px; color:#6b7280;">
                Caso o botão acima não funcione, copie e cole o endereço abaixo em seu navegador:
              </p>

              <p style="font-size:14px; word-break:break-all;">
                <a href="${resetLink}" style="color:#2563eb;">
                  ${resetLink}
                </a>
              </p>

              <hr style="border:none; border-top:1px solid #e5e7eb; margin:32px 0;" />

              <p style="font-size:14px; line-height:22px; color:#6b7280;">
                Se você não solicitou a redefinição da sua senha, ignore este e-mail.
                Nenhuma alteração será realizada em sua conta.
              </p>

              <p style="font-size:14px; line-height:22px; color:#6b7280;">
                Por segurança, recomendamos que você nunca compartilhe este link com terceiros.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background:#f9fafb;
              padding:24px;
              text-align:center;
              font-size:12px;
              color:#9ca3af;
            ">
              © ${Date.now} Sua Empresa. Todos os direitos reservados.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>

</html>
`;
