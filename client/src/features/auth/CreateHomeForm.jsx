import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import * as api from '@/services/api'; // נייבא את כל שירותי ה-API
import LoadingSpinner from '@/components/LoadingSpinner';

const AVAILABLE_ICONS = ['fas fa-home', 'fas fa-house-user', 'fas fa-door-open', 'fas fa-city', 'fas fa-building', 'fas fa-couch', 'fas fa-tree', 'fas fa-lightbulb'];
const AVAILABLE_COLORS = ['card-color-1', 'card-color-2', 'card-color-3'];

const CreateHomeForm = ({ onSuccess }) => {
    const { createHome, loading: isSubmitting, error: submissionError, setError } = useAppContext();
    const { hideModal } = useModal();

    // Form state
    const [name, setName] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [initialUserName, setInitialUserName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
    const [selectedCurrency, setSelectedCurrency] = useState('ILS');

    // --- חדש: State עבור בדיקת שם בזמן אמת ---
    const [nameValidationError, setNameValidationError] = useState('');
    const [isNameValidating, setIsNameValidating] = useState(false);
    const [isNameTaken, setIsNameTaken] = useState(false);

    // --- חדש: לוגיקת Debounce לבדיקת שם הבית ---
    useEffect(() => {
        // אם השדה ריק, נאפס את השגיאות
        if (!name.trim()) {
            setNameValidationError('');
            setIsNameTaken(false);
            return;
        }

        setIsNameValidating(true); // הצג חיווי טעינה
        const handler = setTimeout(async () => {
            try {
                const result = await api.checkHomeName(name.trim());
                if (result.exists) {
                    setNameValidationError('שם הבית הזה כבר תפוס.');
                    setIsNameTaken(true);
                } else {
                    setNameValidationError('');
                    setIsNameTaken(false);
                }
            } catch (e) {
                // לא נחסום את המשתמש אם הבדיקה נכשלה
                setNameValidationError('');
                setIsNameTaken(false);
            } finally {
                setIsNameValidating(false); // הסתר חיווי טעינה
            }
        }, 500); // נחכה 500 מילי-שניות לאחר סיום ההקלדה

        // פונקציית ניקוי: תתבטל את ה-setTimeout הקודם אם המשתמש ממשיך להקליד
        return () => {
            clearTimeout(handler);
        };
    }, [name]); // אפקט זה ירוץ בכל פעם שהמשתנה name משתנה

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (isNameTaken) {
            setNameValidationError('לא ניתן להמשיך, שם הבית תפוס.');
            return;
        }

        if (!name.trim() || !accessCode.trim() || !initialUserName.trim()) {
            setError("נא למלא את כל השדות: שם הבית, קוד גישה, והשם שלך.");
            return;
        }

        if (accessCode.trim().length < 4) {
            setError("קוד הגישה חייב להכיל לפחות 4 תווים.");
            return;
        }

        const homeData = {
            name: name.trim(),
            accessCode: accessCode.trim(),
            initialUserName: initialUserName.trim(),
            iconClass: selectedIcon,
            colorClass: selectedColor,
            currency: selectedCurrency,
        };

        const success = await createHome(homeData);
        if (success) {
            hideModal();
            if (onSuccess) onSuccess();
        }
    };

    return (
        <div className="create-home-form p-4">
            <h3 className="text-xl font-bold mb-4 text-center">יצירת בית חדש</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="homeName" className="block text-sm font-medium text-gray-700">שם הבית:</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            id="homeName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="לדוגמה: בית משפחת כהן"
                            className="mt-1 block w-full p-2 border rounded-md"
                            required
                        />
                        {/* --- חדש: חיווי טעינה ושגיאה --- */}
                        {isNameValidating && <span style={{ position: 'absolute', left: '10px', top: '12px' }}><LoadingSpinner size="sm" /></span>}
                    </div>
                    {nameValidationError && <p className="error-message text-sm mt-1">{nameValidationError}</p>}
                </div>

                <div>
                    <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">קוד גישה (לשיתוף):</label>
                    <input
                        type="password"
                        id="accessCode"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        placeholder="בחר קוד קל לזכירה (לפחות 4 תווים)"
                        className="mt-1 block w-full p-2 border rounded-md"
                        required
                        minLength={4}
                    />
                </div>

                <div>
                    <label htmlFor="initialUserName" className="block text-sm font-medium text-gray-700">השם שלך (מנהל הבית):</label>
                    <input
                        type="text"
                        id="initialUserName"
                        value={initialUserName}
                        onChange={(e) => setInitialUserName(e.target.value)}
                        placeholder="השם שיוצג באפליקציה"
                        className="mt-1 block w-full p-2 border rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">בחר אייקון:</label>
                    <div className="icon-selector mt-2">
                        {AVAILABLE_ICONS.map((icon) => (
                            <i
                                key={icon}
                                className={`${icon} ${selectedIcon === icon ? 'selected' : ''}`}
                                onClick={() => setSelectedIcon(icon)}
                                aria-label={icon}
                            ></i>
                        ))}
                    </div>
                </div>

                {(submissionError) && <p className="error-message text-center">{submissionError}</p>}

                <div className="modal-footer mt-6">
                    <button type="submit" className="primary-action" disabled={isSubmitting || isNameValidating || isNameTaken}>
                        {isSubmitting ? <LoadingSpinner size="sm" /> : 'צור בית'}
                    </button>
                    <button type="button" className="secondary-action" onClick={hideModal}>
                        בטל
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateHomeForm;