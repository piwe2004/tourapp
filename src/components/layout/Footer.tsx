import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo-row">
            <div className="footer-logo-icon">
                <i className="fa-solid fa-plane transform -rotate-45 text-[12px]"></i>
            </div>
            <span className="footer-logo-text">Planni</span>
        </div>
        <p className="footer-description">
          © 2024 Planni. All rights reserved.
        </p>
        <div className="footer-links">
          <Link href="#" className="footer-link-item">이용약관</Link>
          <Link href="#" className="footer-link-item">개인정보처리방침</Link>
          <Link href="#" className="footer-link-item">문의하기</Link>
        </div>
      </div>
    </footer>
  );
}