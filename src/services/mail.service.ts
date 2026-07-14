import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER || 'ngovansuu2004@gmail.com',
        pass: process.env.MAIL_PASS || 'opwr uatp mfxt htdq',
      },
    });
  }

  async sendOtpEmail(to: string, otp: string, name?: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Kho Truyện Tự Kể" <ngovansuu2004@gmail.com>',
      to,
      subject: 'Mã xác minh đăng ký tài khoản độc giả',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FDFBF7; border-radius: 16px; overflow: hidden; border: 1px solid #e0d5c5;">
          <div style="background: linear-gradient(135deg, #2D251E, #1E2D3D); padding: 32px 24px; text-align: center;">
            <h1 style="color: #EEDCBE; margin: 0; font-size: 24px;">📖 Kho Truyện Tự Kể</h1>
            <p style="color: rgba(238,220,190,0.7); margin: 8px 0 0; font-size: 14px;">Hệ thống truyện tương tác</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #2D251E; font-size: 16px; margin-top: 0;">
              Xin chào${name ? ` <strong>${name}</strong>` : ''}!
            </p>
            <p style="color: #2D251E; font-size: 14px;">
              Bạn vừa yêu cầu đăng ký tài khoản độc giả. Sử dụng mã OTP bên dưới để xác minh email:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; background: #2D251E; border-radius: 12px; padding: 16px 40px;">
                <span style="color: #EEDCBE; font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: monospace;">${otp}</span>
              </div>
            </div>
            <p style="color: #666; font-size: 13px; text-align: center;">
              Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này cho bất kỳ ai.
            </p>
          </div>
          <div style="background: #f5ede0; padding: 16px 24px; text-align: center; border-top: 1px solid #e0d5c5;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.
            </p>
          </div>
        </div>
      `,
    });
  }
}
