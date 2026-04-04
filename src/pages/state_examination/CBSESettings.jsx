import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import '../../utils/include_files';
import { useSession } from '../../context/SessionContext';

const CBSESettings = () => {
    const { sessionYear } = useSession();
    const navigate = useNavigate();

    return (
        <div className="wrapper theme-white-skin" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Sidebar />

            <div className="content-wrapper" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>
                <section className="content-header">
                    <h1><i className="fa fa-ioxhost" style={{ marginRight: '5px' }}></i> Setting</h1>
                </section>
                <section className="content">
                    <div className="row">
                        {/* Left Column */}
                        <div className="col-md-12">
                            <div className="box box-primary">
                                <div className="box-header ptbnull">
                                    <h3 className="box-title titlefix"><i className="fa fa-gear" style={{ marginRight: '5px' }}></i> Setting</h3>
                                    <div className="btn-group pull-right">
                                        <button
                                            onClick={() => navigate('/cbseexam/exam')}
                                            className="btn btn-primary btn-xs"
                                        >
                                            <i className="fa fa-arrow-left" style={{ marginRight: '3px' }}></i> Back
                                        </button>
                                    </div>
                                </div>{/* /.box-header */}
                                <div className="">
                                    <div className="box-body">
                                        <div className="row">
                                            <div className="row">
                                                {/* Content is empty in the source file, so keeping it empty here */}
                                            </div>
                                        </div>{/*./row*/}
                                    </div>{/* /.box-body */}
                                    <div className="box-footer">
                                        <div className="pull-right">Version 1.0.0</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>{/* /.content */}
            </div>
            <Footer />
        </div>
    );
};

export default CBSESettings;
