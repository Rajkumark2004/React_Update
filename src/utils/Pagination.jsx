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

    return (
        <div className="row" style={{ display: isMobile ? 'flex' : 'block', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'stretch', gap: isMobile ? '10px' : '0' }}>
            <div className={isMobile ? "text-center" : "col-sm-5"}>
                <div className="dataTables_info">
                    Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                </div>
            </div>
            <div className={isMobile ? "text-center" : "col-sm-7"}>
                <div className={`dataTables_paginate paging_simple_numbers ${isMobile ? '' : 'pull-right'}`}>
                    <ul className="pagination" style={{ margin: 0 }}>
                        <li className={`paginate_button previous ${currentPage === 1 ? 'disabled' : ''}`}>
                            <a href="#" onClick={(e) => { 
                                e.preventDefault(); 
                                if(currentPage > 1) onPageChange(currentPage - 1); 
                            }}>
                                <i className="fa fa-angle-left"></i>
                            </a>
                        </li>
                        
                        {totalPages > 0 && totalPages < 1000 && [...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            return (
                                <li key={p} className={`paginate_button ${currentPage === p ? 'active' : ''}`}>
                                    <a href="#" onClick={(e) => { 
                                        e.preventDefault(); 
                                        onPageChange(p); 
                                    }}>
                                        {p}
                                    </a>
                                </li>
                            );
                        })}

                        <li className={`paginate_button next ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}>
                            <a href="#" onClick={(e) => { 
                                e.preventDefault(); 
                                if(currentPage < totalPages) onPageChange(currentPage + 1); 
                            }}>
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
