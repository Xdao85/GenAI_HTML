/* ============ CẤU HÌNH CHUNG CHO TOÀN BỘ TRANG ============
 * Dán URL Web App của collector.gs (Google Apps Script) vào ENDPOINT.
 * Để trống: câu trả lời và nhật ký chỉ lưu trên trình duyệt của người dùng
 * (tải về bằng survey.html?admin=1 hoặc nút "Tải nhật ký").
 */
window.P2_CONFIG = {
  ENDPOINT: 'https://script.google.com/macros/s/AKfycby8XGCrvUcPIjhZoo8rcJM_mAhZG60Vby0ykeSHGDRVbPA64IcpKiN62s4obiu2E7nsOA/exec',  // nhận câu trả lời khảo sát (sheet survey_student / survey_lecturer)
  LOG_ENDPOINT: '',        // nhận nhật ký demo (sheet log_summary); để trống = dùng ENDPOINT
  STUDY_ID: 'paper2-html-survey-v1'
};
if (!window.P2_CONFIG.LOG_ENDPOINT) window.P2_CONFIG.LOG_ENDPOINT = window.P2_CONFIG.ENDPOINT;
