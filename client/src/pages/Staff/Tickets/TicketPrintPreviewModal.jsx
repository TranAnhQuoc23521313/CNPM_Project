// src/pages/Staff/Tickets/TicketPrintPreviewModal.jsx
import React, { useEffect } from 'react'; // Thêm useEffect
import Button from '../../../components/common/Button';
import TicketItem from './TicketItem';
import './TicketPrintPreview.css'; // CSS cho nội dung vé VÀ cả modal

// Component này giờ sẽ tự quản lý việc hiển thị như một modal
const TicketPrintPreviewModal = ({ isOpen, onClose, tickets, orderId, isLoading, title }) => {
    // Xử lý đóng modal khi nhấn phím Escape
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    // Ngăn cuộn trang nền khi modal mở
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { // Cleanup function
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleActualPrint = () => {
        const printableArea = document.getElementById('printable-ticket-area-modal');
        if (printableArea) {
            const printContents = printableArea.innerHTML;
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            const iframeDoc = iframe.contentWindow.document;
            iframeDoc.open();
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(style => {
                iframeDoc.write(style.outerHTML);
            });
            iframeDoc.write('<body class="iframe-print-body">');
            iframeDoc.write(`<div class="print-only-wrapper">${printContents}</div>`);
            iframeDoc.write('</body>');
            iframeDoc.close();
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => {
                 document.body.removeChild(iframe);
            }, 500);
        }
    };

    if (!isOpen) {
        return null; // Không render gì cả nếu không mở
    }

    return (
        // Lớp phủ ngoài cùng của modal
        <div className={`custom-modal-overlay ${isOpen ? 'modal-open' : ''}`} onClick={onClose}>
            {/* Khung chứa nội dung modal */}
            <div
                className="custom-modal-dialog ticket-print-modal-dialog-size" // Class cho kích thước và style dialog
                onClick={(e) => e.stopPropagation()} // Ngăn click bên trong đóng modal
            >
                <div className="custom-modal-header">
                    <h2 className="custom-modal-title">{title || `Xem Trước & In Vé: ${orderId || 'N/A'}`}</h2>
                    <button onClick={onClose} className="custom-modal-close-button" aria-label="Đóng modal">
                        ×
                    </button>
                </div>
                <div className="custom-modal-body ticket-print-preview-modal-content">
                    {isLoading && <p className="loading-text">Đang tải dữ liệu vé...</p>}
                    {!isLoading && tickets && tickets.length > 0 && (
                        <>
                            <div id="printable-ticket-area-modal">
                                {tickets.map((ticket) => (
                                    <div key={ticket.maVe} className="ticket-wrapper-for-preview">
                                        <TicketItem ticket={ticket} />
                                        <div className="print-page-break"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-actions-print no-print-modal" style={{ textAlign: 'right', marginTop: '20px', paddingBottom: '10px' }}>
                                <Button onClick={handleActualPrint} variant="primary">
                                    Xác Nhận In
                                </Button>
                                <Button onClick={onClose} variant="secondary" style={{ marginLeft: '10px' }}>
                                    Đóng
                                </Button>
                            </div>
                        </>
                    )}
                    {!isLoading && (!tickets || tickets.length === 0) && (
                        <p className="no-tickets-message">Không có vé nào để hiển thị cho hóa đơn này.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketPrintPreviewModal;