import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';
import SettingsMenu from '../../../components/SettingsMenu';
import '../../../utils/include_files.js';

const IdAutoGeneration = () => {
    const [formData, setFormData] = useState({
        adm_auto_insert: '0',
        adm_prefix: '',
        adm_no_digit: '',
        adm_start_from: '',
        staffid_auto_insert: '0',
        staffid_prefix: '',
        staffid_no_digit: '',
        staffid_start_from: '',
    });
    const [originalData, setOriginalData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [digitList, setDigitList] = useState([]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await api.getIdAutoGeneration();
            if (response && response.result) {
                const settings = response.result;
                const newFormData = {
                    adm_auto_insert: settings.adm_auto_insert !== null ? String(settings.adm_auto_insert) : '0',
                    adm_prefix: settings.adm_prefix || '',
                    adm_no_digit: settings.adm_no_digit || '',
                    adm_start_from: settings.adm_start_from || '',
                    staffid_auto_insert: settings.staffid_auto_insert !== null ? String(settings.staffid_auto_insert) : '0',
                    staffid_prefix: settings.staffid_prefix || '',
                    staffid_no_digit: settings.staffid_no_digit || '',
                    staffid_start_from: settings.staffid_start_from || '',
                };
                setFormData(newFormData);
                setOriginalData(newFormData);
            }
            // Use digits from API response
            if (response && response.digits) {
                const digits = Object.values(response.digits).map(String);
                setDigitList(digits);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRadioChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: String(value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation based on php view required fields
        if (!formData.adm_prefix) {
            toast.error("Admission No Prefix is required");
            return;
        }
        if (!formData.adm_no_digit) {
            toast.error("Admission No Digit is required");
            return;
        }
        if (!formData.adm_start_from) {
            toast.error("Admission Start From is required");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                sch_id: 1,
                adm_auto_insert: Number(formData.adm_auto_insert),
                adm_prefix: formData.adm_prefix,
                adm_start_from: formData.adm_start_from,
                adm_no_digit: formData.adm_no_digit ? Number(formData.adm_no_digit) : '',
                staffid_auto_insert: Number(formData.staffid_auto_insert),
                staffid_prefix: formData.staffid_prefix,
                staffid_start_from: formData.staffid_start_from,
                staffid_no_digit: formData.staffid_no_digit ? Number(formData.staffid_no_digit) : '',
            };
            const response = await api.saveIdAutoGeneration(payload);
            if (response.status) {
                toast.success(response.message || 'ID Auto Generation Settings saved successfully');
                fetchSettings(); // Refresh data
            } else {
                if (response.error && typeof response.error === 'object') {
                    Object.values(response.error).forEach(err => toast.error(err));
                } else if (response.error) {
                    toast.error(response.error);
                } else {
                    toast.error(response.message || 'Failed to save settings');
                }
            }
        } catch (error) {
            console.error('Error saving ID Auto Generation settings:', error);
            toast.error('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <SettingsMenu>
                <div className="box box-primary">
                    <div className="box-body text-center">
                        <i className="fa fa-spinner fa-spin fa-2x"></i> Loading...
                    </div>
                </div>
            </SettingsMenu>
        );
    }

    return (
        <SettingsMenu>
            <div className="box box-primary">
                <div className="box-header ptbnull">
                    <h3 className="box-title titlefix"><i className="fa fa-gear"></i> ID Auto Generation</h3>
                </div>
                <div className="">
                    <form role="form" id="id_auto_generation_form" method="post" onSubmit={handleSubmit}>
                        <div className="box-body">
                            <div className="row">
                                <div className="col-md-12">
                                    <h4 className="session-head">Student Admission No Auto Generation</h4>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-3">Auto Admission No</label>
                                        <div className="col-sm-9">
                                            <label className="radio-inline">
                                                <input
                                                    type="radio"
                                                    name="adm_auto_insert"
                                                    value="0"
                                                    checked={formData.adm_auto_insert === '0'}
                                                    onChange={() => handleRadioChange('adm_auto_insert', 0)}
                                                /> Disabled
                                            </label>
                                            <label className="radio-inline">
                                                <input
                                                    type="radio"
                                                    name="adm_auto_insert"
                                                    value="1"
                                                    checked={formData.adm_auto_insert === '1'}
                                                    onChange={() => handleRadioChange('adm_auto_insert', 1)}
                                                /> Enabled
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-3">Admission No Prefix<small className="req"> *</small></label>
                                        <div className="col-sm-9">
                                            <input
                                                type="text"
                                                name="adm_prefix"
                                                id="adm_prefix"
                                                className="form-control"
                                                value={formData.adm_prefix}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-3">Admission No Digit<small className="req"> *</small></label>
                                        <div className="col-sm-9">
                                            <select id="adm_no_digit" name="adm_no_digit" className="form-control" value={formData.adm_no_digit} onChange={handleInputChange}>
                                                <option value="">Select</option>
                                                {digitList.map(digit => (
                                                    <option key={digit} value={digit}>{digit}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-3">Admission Start From<small className="req"> *</small></label>
                                        <div className="col-sm-9">
                                            <input
                                                type="text"
                                                name="adm_start_from"
                                                id="adm_start_from"
                                                className="form-control"
                                                value={formData.adm_start_from}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="settinghr"></div>
                                    <h4 className="session-head">Staff ID Auto Generation</h4>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-3">Auto Staff ID</label>
                                        <div className="col-sm-9">
                                            <label className="radio-inline">
                                                <input
                                                    type="radio"
                                                    name="staffid_auto_insert"
                                                    value="0"
                                                    checked={formData.staffid_auto_insert === '0'}
                                                    onChange={() => handleRadioChange('staffid_auto_insert', 0)}
                                                /> Disabled
                                            </label>
                                            <label className="radio-inline">
                                                <input
                                                    type="radio"
                                                    name="staffid_auto_insert"
                                                    value="1"
                                                    checked={formData.staffid_auto_insert === '1'}
                                                    onChange={() => handleRadioChange('staffid_auto_insert', 1)}
                                                /> Enabled
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-3">Staff ID Prefix<small className="req"> *</small></label>
                                        <div className="col-sm-9">
                                            <input
                                                id="staffid_prefix"
                                                value={formData.staffid_prefix}
                                                name="staffid_prefix"
                                                type="text"
                                                className="form-control"
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-3">Staff No Digit<small className="req"> *</small></label>
                                        <div className="col-sm-9">
                                            <select id="staffid_no_digit" name="staffid_no_digit" className="form-control" value={formData.staffid_no_digit} onChange={handleInputChange}>
                                                <option value="">Select</option>
                                                {digitList.map(digit => (
                                                    <option key={digit} value={digit}>{digit}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group row">
                                        <label className="col-sm-3">Staff ID Start From<small className="req"> *</small></label>
                                        <div className="col-sm-9">
                                            <input
                                                id="staffid_start_from"
                                                value={formData.staffid_start_from}
                                                name="staffid_start_from"
                                                type="text"
                                                className="form-control"
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="box-footer">
                            <button
                                type="submit"
                                className="btn btn-info pull-right"
                                disabled={isSaving}
                            >
                                {isSaving ? <><i className='fa fa-circle-o-notch fa-spin'></i> Processing...</> : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SettingsMenu>
    );
};

export default IdAutoGeneration;
