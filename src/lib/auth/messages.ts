/**
 * 理解万岁 · 认证文案与错误映射
 * 使用 Cursor 制作
 */

export const REAL_NAME_HINT = "务必填写真实姓名";

export const REAL_NAME_REQUIRED =
  "请先登录并完成真实姓名登记，否则无法进行此操作";

export const REAL_NAME_TAKEN_HINT =
  "若真实姓名已被占用，请发邮件至 support@ethan128.top 证明身份后由人工处理。";

export const SUPPORT_EMAIL = "support@ethan128.top";

export const PRIVACY_AGREE_HINT =
  "注册即表示你已阅读并同意《隐私政策》";

export function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("真实姓名已被占用") ||
    m.includes("duplicate") ||
    m.includes("unique") ||
    m.includes("23505")
  ) {
    return `真实姓名已被占用。${REAL_NAME_TAKEN_HINT}`;
  }
  if (m.includes("务必填写真实姓名") || m.includes("real_name")) {
    return REAL_NAME_HINT;
  }
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "邮箱或密码不正确";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "该邮箱已注册，请直接登录";
  }
  if (m.includes("password")) {
    return "密码不符合要求（至少 6 位）";
  }
  if (m.includes("email")) {
    return "请填写有效邮箱";
  }
  return message || "操作失败，请稍后重试";
}
