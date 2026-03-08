import { Navigate } from "react-router-dom";

// Legacy page - redirects to GerenciamentoAlunos
const AdminStudentManagement = () => <Navigate to="/gerenciamento-alunos" replace />;

export default AdminStudentManagement;
