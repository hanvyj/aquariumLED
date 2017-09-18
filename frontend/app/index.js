import ajax from '@fdaciuk/ajax';
import ScheduleChart from './scheduleChart';

const scheduleChart = new ScheduleChart('scheduleChart', {});

window.refresh = function(){
  console.log('refreshing');
  ajax().post('/server/api/refresh');
};
