
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

}