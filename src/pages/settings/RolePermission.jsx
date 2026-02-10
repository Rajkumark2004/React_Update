import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../services/api';

const RolePermission = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [role, setRole] = useState({ name: '' });
    const [rolePermissions, setRolePermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPermissions();
    }, [id]);

    const fetchPermissions = async () => {
        setIsLoading(true);
        try {
            const response = await api.getRolePermissions(id);
            if (response.status === 'success') {
                setRole(response.role);
                setRolePermissions(response.role_permission);
            } else {
                setError(response.message || 'Failed to fetch permissions');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckboxChange = (permId, type) => {
        const newPermissions = [...rolePermissions];
        newPermissions.forEach(module => {
            module.permission_category.forEach(perm => {
                if (perm.id === permId) {
                    perm[type] = perm[type] === "1" ? "0" : "1";
                }
            });
        });
        setRolePermissions(newPermissions);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {};
            const per_cat = [];

            rolePermissions.forEach(module => {
                module.permission_category.forEach(perm => {
                    const pid = perm.id;
                    per_cat.push(Number(pid));
                    payload[`roles_permissions_id_${pid}`] = Number(perm.roles_permissions_id || 0);
                    payload[`can_view-perm_${pid}`] = Number(perm.can_view || 0);
                    payload[`can_add-perm_${pid}`] = Number(perm.can_add || 0);
                    payload[`can_edit-perm_${pid}`] = Number(perm.can_edit || 0);
                    payload[`can_delete-perm_${pid}`] = Number(perm.can_delete || 0);
                });
            });

            payload.per_cat = per_cat;

            const response = await api.updateRolePermissions(id, payload);
            if (response.status === 'success') {
                alert('Record Saved Successfully');
                navigate('/settings/roles');
            } else {
                alert(response.message || 'Failed to save permissions');
            }
        } catch (err) {
            alert('Error saving permissions: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && rolePermissions.length === 0) {
        return (
            <div className="wrapper">
                <Header />
                <Sidebar />
                <div className="content-wrapper">
                    <section className="content">
                        <p>Loading permissions...</p>
                    </section>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="wrapper">
                <Header />
                <Sidebar />
                <div className="content-wrapper">
                    <section className="content">
                        <p className="text-danger">Error: {error}</p>
                        <button onClick={fetchPermissions} className="btn btn-primary">Retry</button>
                    </section>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="wrapper">
            <Header />
            <Sidebar />
            <div className="content-wrapper" style={{ minHeight: '946px' }}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="box box-primary" style={{ border: 'none', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
                                <div className="box-header with-border" style={{ borderBottom: '1px solid #f4f4f4', padding: '15px' }}>
                                    <h3 className="box-title" style={{ fontSize: '18px', color: '#333' }}>
                                        Assign Permission ({role.name})
                                    </h3>
                                </div>
                                <form id="form1" onSubmit={handleSave}>
                                    <div className="box-body" style={{ padding: '0' }}>
                                        <div className="table-responsive">
                                            <table className="table table-striped table-bordered table-hover" style={{ margin: '0' }}>
                                                <thead>
                                                    <tr style={{ background: '#f9f9f9' }}>
                                                        <th style={{ width: '20%' }}>Module</th>
                                                        <th style={{ width: '25%' }}>Feature</th>
                                                        <th style={{ textAlign: 'center' }}>View</th>
                                                        <th style={{ textAlign: 'center' }}>Add</th>
                                                        <th style={{ textAlign: 'center' }}>Edit</th>
                                                        <th style={{ textAlign: 'center' }}>Delete</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rolePermissions.map((module, mIdx) => (
                                                        <React.Fragment key={mIdx}>
                                                            {module.permission_category.map((perm, pIdx) => (
                                                                <tr key={perm.id}>
                                                                    {pIdx === 0 ? (
                                                                        <th style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>
                                                                            {module.name}
                                                                        </th>
                                                                    ) : (
                                                                        <td></td>
                                                                    )}
                                                                    <td>
                                                                        {perm.name}
                                                                        <input type="hidden" name="per_cat[]" value={perm.id} />
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {perm.enable_view === "1" && (
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={perm.can_view === "1"}
                                                                                onChange={() => handleCheckboxChange(perm.id, 'can_view')}
                                                                            />
                                                                        )}
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {perm.enable_add === "1" && (
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={perm.can_add === "1"}
                                                                                onChange={() => handleCheckboxChange(perm.id, 'can_add')}
                                                                            />
                                                                        )}
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {perm.enable_edit === "1" && (
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={perm.can_edit === "1"}
                                                                                onChange={() => handleCheckboxChange(perm.id, 'can_edit')}
                                                                            />
                                                                        )}
                                                                    </td>
                                                                    <td style={{ textAlign: 'center' }}>
                                                                        {perm.enable_delete === "1" && (
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={perm.can_delete === "1"}
                                                                                onChange={() => handleCheckboxChange(perm.id, 'can_delete')}
                                                                            />
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="box-footer" style={{ borderTop: '1px solid #f4f4f4', padding: '15px' }}>
                                        <button
                                            type="submit"
                                            className="btn btn-info pull-right"
                                            disabled={isLoading}
                                            style={{ background: '#00c0ef', border: 'none', color: '#fff', padding: '6px 12px' }}
                                        >
                                            {isLoading ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default RolePermission;
