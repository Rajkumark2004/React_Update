import React from 'react';

// _search.php was likely a partial view or a smaller search component used within other pages
// Replicating it as a reusable React component

const SearchPartial = ({ onSearch }) => {
    return (
        <div className="input-group">
            <input
                type="text"
                name="search_text"
                className="form-control search_text"
                placeholder="Search..."
                onChange={(e) => onSearch && onSearch(e.target.value)}
            />
            <span className="input-group-btn">
                <button type="submit" className="btn btn-primary btn-sm">
                    <i className="fa fa-search"></i>
                </button>
            </span>
        </div>
    );
};

export default SearchPartial;
