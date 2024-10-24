import { Firestore } from "firebase/firestore";

export class DateFunctions {

    formatDateToInput(dateString: string) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];
            
            return `${year}-${month}-${day}`;
        }
        throw new Error('Formato de fecha no válido');
    }

    formatDateDDMMAAAA(dateString: string) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];

            return `${day}/${month}/${year}`;
        }
        throw new Error('Formato de fecha no válido');
    }

    formatDateAAAAMMDD(dateString: string) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];

            return `${year}-${month}-${day}`;
        }
        throw new Error('Formato de fecha no válido');
    }

    formatDate(date: string) {
        if (!date) {
            throw new Error('Fecha no válida');
        }
        const [year, month, day] = date.split('-').map(Number); // Suponiendo el formato YYYY-MM-DD
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            throw new Error('Fecha no válida');
        }

        const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        return formattedDate;
    }

    todayDate = () => {
        const fecha = new Date();
        const dia = fecha.getDate().toString().padStart(2, '0');
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const año = fecha.getFullYear();
        return `${dia}/${mes}/${año}`;
    }

    formatDateFirebase = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;  
    };

}