import React from 'react';

const Loader = ({ type = 'table', rows = 5 }) => {
    if (type === 'dashboard') {
        return (
            <div className="skeleton-loader-container dashboard-skeleton">
                <div className="row hello-div"> {/* Match main content structural div */}

                    {/* LEFT COLUMN (9 cols) */}
                    <div className="col-lg-9 col-md-9 col-sm-12">

                        {/* Search Bar Skeleton (Desktop) */}
                        <div className="content-search-bar hide-mobile" style={{ marginBottom: '20px' }}>
                            <div className="skeleton-line shimmer" style={{ height: '40px', borderRadius: '30px', width: '100%' }}></div>
                        </div>

                        {/* Welcome Card Skeleton */}
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="skeleton-card" style={{ height: '180px', width: '100%', borderRadius: '20px', padding: '30px', display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ width: '60%' }}>
                                        <div className="skeleton-line shimmer" style={{ width: '40%', height: '20px', marginBottom: '15px' }}></div>
                                        <div className="skeleton-line shimmer" style={{ width: '80%', height: '15px', marginBottom: '10px' }}></div>
                                        <div className="skeleton-line shimmer" style={{ width: '30%', height: '40px', marginTop: '20px', borderRadius: '20px' }}></div>
                                    </div>
                                    <div className="skeleton-icon-circle no-shimmer" style={{ width: '120px', height: '120px', borderRadius: '50%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Cards Skeleton (3 cols) */}
                        <div className="col-lg-12 col-md-12 col-sm-12" style={{ padding: 0, marginTop: 20 }}>
                            <div className="row">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="col-lg-4 col-md-6 col-sm-12">
                                        <div className="skeleton-card skeleton-card-medium" style={{ height: '180px', borderRadius: '20px', marginBottom: '20px', width: '100%' }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Vacancies Table Skeleton */}
                        <div className="col-lg-12 col-md-12 col-sm-12" style={{ padding: 0, marginTop: 20 }}>
                            <div className="skeleton-card" style={{ height: '400px', width: '100%', borderRadius: '20px', padding: '20px' }}>
                                <div className="skeleton-line shimmer" style={{ width: '30%', height: '24px', marginBottom: '30px' }}></div>
                                <div className="skeleton-line shimmer" style={{ width: '100%', height: '40px', marginBottom: '15px' }}></div>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="skeleton-line shimmer" style={{ width: '100%', height: '30px', marginBottom: '10px', opacity: 0.6 }}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (3 cols) */}
                    <div className="mt-10 col-lg-3 col-md-3 col-sm-12">

                        {/* User Profile Skeleton */}
                        <div className="hide-on-mobile mt-15" style={{ marginBottom: '20px' }}>
                            <div className="skeleton-card" style={{ height: '200px', width: '100%', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {/* REMOVED LOGO SKELETON */}
                                <div className="skeleton-line shimmer" style={{ width: '60%', height: '20px', marginBottom: '10px', marginTop: '20px' }}></div>
                                <div className="skeleton-line shimmer" style={{ width: '40%', height: '15px' }}></div>
                            </div>
                        </div>

                        {/* Fee Summary Skeleton */}
                        <div className="skeleton-card" style={{ height: '300px', width: '100%', borderRadius: '20px', padding: '20px' }}>
                            <div className="skeleton-line shimmer" style={{ width: '50%', height: '24px', marginBottom: '30px' }}></div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                    <div className="skeleton-icon-circle shimmer" style={{ width: '40px', height: '40px', marginRight: '15px' }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton-line shimmer" style={{ width: '80%', height: '15px', marginBottom: '5px' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // Default: Table Loader
    return (
        <div className="skeleton-loader-container">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="skeleton-row">
                    <div className="skeleton-cell"></div>
                    <div className="skeleton-cell"></div>
                    <div className="skeleton-cell"></div>
                </div>
            ))}
        </div>
    );
};

export default Loader;
