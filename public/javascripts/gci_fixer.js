function SortByDate(a, b){
  return ((a._date < b._date) ? -1 : ((a._date > b._date) ? 1 : 0));
}

function get_last_date(array){
  return new Date(Math.max.apply(Math,array.map(function(o){return o._date;})));
}

function get_first_date(array){
  return new Date(Math.min.apply(Math,array.map(function(o){return o._date;})));
}

function determine_diff_days(start_date, end_date){
  return Math.ceil( (start_date - end_date) / (1000 * 3600 * 24));
}

function blank_detail_days_setup(array){
  _latest_date    = get_last_date(array);
  _beginning_date = get_first_date(array);
  _beginning_date.setDate(_beginning_date.getDate()-1);
  _beginning_date.setMonth(_beginning_date.getMonth()+1);
  _diff_days      = determine_diff_days(_beginning_date, _latest_date);

  return {beginning_date: _beginning_date, end_date: _latest_date, diff_days: _diff_days};
}



function fetch_internet_detail_row_data($table){
  temp = [];

  $table.find('tr.data').each(function(index){
    r = {};
    r['_date'] = new Date($(this).find('td.usage-date .full-date').text());
    r['usage_date'] = $(this).find('td.usage-date .part-date').text();
    r['upload']= parseFloat($(this).find('td.upstream').text());
    r['download']= parseFloat($(this).find('td.downstream').text());
    r['total']=parseFloat($(this).find('td.running-total').text());
    temp.push(r);
  });

  dates = blank_detail_days_setup(temp);

  for(i=0;i<dates.diff_days;i++){
    t_usage_date = new Date(dates.end_date.setDate(dates.end_date.getDate()+1));

    diff_r               = {};
    diff_r['_date']      = t_usage_date;
    diff_r['usage_date'] = t_usage_date.getMonth()+1 + '/' + t_usage_date.getDate();
    diff_r['upload']     = null;
    diff_r['download']   = null;
    diff_r['total']      = null;

    // for the first one, put the latest total in
    if (i === 0) {
        diff_r['total'] = total;
    }

    temp.push(diff_r);
  }//end for
  return temp.sort(SortByDate);
} // fetch_internet_detail_row_data



function build_internet_detail_chart(){
  date_range      = [];
  upload_values   = [];
  download_values = [];
  total_values = [];


  $.each(fetch_internet_detail_row_data($('table#internet-detail-usage')), function(index, item) {
    date_range.push(item.usage_date);
    upload_values.push(item.upload);
    download_values.push(item.download);
    total_values.push(item.total);
  });


  options = stacked_chart_options(  'detail-chart',
                                    [
                                        {
                                            name: 'Total',
                                            data: total_values
                                        },
                                        {
                                            name: 'Average',
                                            data:[ [0,0], [date_range.length-1, 150] ],
                                            type:'line',
                                            marker: {
                                                enabled: false
                                            }
                                        }
                                    ],
                                    date_range)

  chart = new Highcharts.Chart(options);
  $('.highcharts-container>svg>text>tspan').remove();
  var left = Math.round((150 - total)/dates.diff_days*100)/100;
  $('#left').text(left + 'GB per day left')

}//end build_shared_mobile_detail_chart





function stacked_chart_options(render_to, data_array, x_axis){
  return {
      chart: {
          type: 'area',
          renderTo: render_to
          },
      title: {
          text: ''
      },
      xAxis: {
            categories: x_axis,
            labels: {
              rotation: -45,
              align: 'right',
              style: {
                  fontSize: '10px'
              }
            }
        },
        yAxis: {
            min: 0,
            max: 150,
            title: {
              text: ''
            },
            stackLabels: {
                enabled: false
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                return '<b>'+ this.x +'</b><br/>'+
                    this.series.name +': '+ this.y
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: false,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                }
            }
        },
        series: data_array
    }


}//end stacked_chart_options




build_internet_detail_chart();
