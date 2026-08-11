import { useEffect } from 'react'

export function LandscapeGuard() {
  // Dùng CSS media query để handle — component này chỉ cần render DOM
  return (
    <div className="landscape-guard" role="alert" aria-live="polite">
      <div className="landscape-guard-icon">🚀</div>
      <h2>Xoay ngang màn hình</h2>
      <p>
        Hành trình vũ trụ được thiết kế cho chế độ ngang.
        Hãy xoay điện thoại của bạn để có trải nghiệm tốt nhất!
      </p>
    </div>
  )
}
