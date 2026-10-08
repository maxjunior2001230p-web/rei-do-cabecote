import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const useAdminFormRoute = ({
  basePath,
  emptyValue,
  setValue,
  setIsEditing,
  loadById,
  onLoadError,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const emptyValueRef = useRef(emptyValue);
  const isFormRoute = location.pathname.startsWith(`${basePath}/`);

  useEffect(() => {
    if (!isFormRoute) return;

    if (!id) {
      setValue({ ...emptyValueRef.current });
      setIsEditing(false);
      return;
    }

    const routeValue = location.state?.formValue;
    if (routeValue) {
      setValue({ ...routeValue });
      setIsEditing(true);
      return;
    }

    let cancelled = false;
    loadById(id)
      .then((value) => {
        if (cancelled) return;
        if (!value) {
          onLoadError(new Error(`Registro ${id} não encontrado`));
          navigate(basePath, { replace: true });
          return;
        }
        setValue({ ...value });
        setIsEditing(true);
      })
      .catch((error) => {
        if (cancelled) return;
        onLoadError(error);
        navigate(basePath, { replace: true });
      });

    return () => {
      cancelled = true;
    };
  }, [basePath, id, isFormRoute, loadById, location.state, navigate, onLoadError, setIsEditing, setValue]);

  const openNew = useCallback(() => {
    setValue({ ...emptyValueRef.current });
    setIsEditing(false);
    navigate(`${basePath}/novo`);
  }, [basePath, navigate, setIsEditing, setValue]);

  const openEdit = useCallback((value) => {
    setValue({ ...value });
    setIsEditing(true);
    navigate(`${basePath}/editar/${value.id}`, { state: { formValue: value } });
  }, [basePath, navigate, setIsEditing, setValue]);

  const closeForm = useCallback(() => navigate(basePath), [basePath, navigate]);
  return { isFormRoute, isEditingRoute: Boolean(id), openNew, openEdit, closeForm, finishSave: closeForm };
};

export default useAdminFormRoute;
