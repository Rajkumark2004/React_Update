import React from 'react';

const Pagination = ({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange
}) => {
    // If recordsPerPage is -1 (All), calculate safely to prevent division by zero or infinity
    const safeItemsPerPage = itemsPerPage === -1 ? (totalItems || 1) : itemsPerPage;
    const totalPages = Math.ceil(totalItems / safeItemsPerPage);
    const indexOfLastItem = currentPage * (itemsPerPage === -1 ? totalItems : itemsPerPage);
    const indexOfFirstItem = indexOfLastItem - (itemsPerPage === -1 ? totalItems : itemsPerPage);

    // If there are no items, do not render pagination
    if (totalItems === 0) return null;

    // Optional: detect if the device is mobile for responsiveness (mimicking StudentSearch.jsx logic)
    const isMobile = window.innerWidth < 768;

    const handlePageClick = (e, page) => {
        e.preventDefault();
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
            // Capture target before entering setTimeout because React pools events
            const target = e.currentTarget;
            
            // Defer scrolling to next event loop tick so React finishes rendering the new list.
            setTimeout(() => {
                const element = target.closest('.box') || 
                                target.closest('.nav-tabs-custom') || 
                                document.querySelector('.content-header') || 
                                document.documentElement;
                
                if (element && element !== document.documentElement) {
                    const rect = element.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    // Scroll to the top of the container with a small offset for the header
                    window.scrollTo({ top: rect.top + scrollTop - 10, behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 100); // 100ms is safer for DOM updates
        }
    };

    return (
        <div className="row" style={{ display: isMobile ? 'flex' : 'block', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'stretch', gap: isMobile ? '10px' : '0' }}>
            <div className={isMobile ? "text-center" : "col-sm-5"}>
                <div className="dataTables_info">
                    Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} Records
                </div>
            </div>
            <div className={isMobile ? "text-center" : "col-sm-7"}>
                <div className={`dataTables_paginate paging_simple_numbers ${isMobile ? '' : 'pull-right'}`}>
                    <ul className="pagination" style={{ margin: 0 }}>
                        <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                            <a href="#" onClick={(e) => handlePageClick(e, currentPage - 1)}>
                                <i className="fa fa-angle-left"></i>
                            </a>
                        </li>

                        {(() => {
                            const pages = [];
                            if (totalPages <= 7) {
                                for (let i = 1; i <= totalPages; i++) pages.push(i);
                            } else {
                                if (currentPage <= 4) {
                                    pages.push(1, 2, 3, 4, 5, '...', totalPages);
                                } else if (currentPage >= totalPages - 3) {
                                    pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                } else {
                                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                                }
                            }
                            
                            return pages.map((p, i) => {
                                if (p === '...') {
                                    return (
                                        <li key={`ellipsis-${i}`} className="paginate_button disabled">
                                            <span style={{ padding: '6px 12px', border: '1px solid transparent', background: 'transparent', color: '#777' }}>...</span>
                                        </li>
                                    );
                                }
                                return (
                                    <li key={p} className={`paginate_button ${currentPage === p ? 'active' : ''}`}>
                                        <a href="#" onClick={(e) => handlePageClick(e, p)}>
                                            {p}
                                        </a>
                                    </li>
                                );
                            });
                        })()}

                        <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                            <a href="#" onClick={(e) => handlePageClick(e, currentPage + 1)}>
                                <i className="fa fa-angle-right"></i>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
