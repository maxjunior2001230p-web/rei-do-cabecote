import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Importe o BrowserRouter
import App from './App.jsx';
import './index.css';
import { addLocale, locale, PrimeReactProvider } from 'primereact/api';

// Importações do PrimeReact
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

addLocale('pt-BR', {
  firstDayOfWeek: 0,
  dayNames: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  monthNames: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  monthNamesShort: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  today: 'Hoje',
  clear: 'Limpar',
  chooseDate: 'Escolher data',
  prevMonth: 'Mês anterior',
  nextMonth: 'Próximo mês',
  prevYear: 'Ano anterior',
  nextYear: 'Próximo ano',
  chooseMonth: 'Escolher mês',
  chooseYear: 'Escolher ano',
  weekHeader: 'Sm',
  showMonthAfterYear: false,
  dateFormat: 'dd/mm/yy'
});
locale('pt-BR');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrimeReactProvider value={{ hideOverlaysOnDocumentScrolling: true }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PrimeReactProvider>
  </React.StrictMode>,
)