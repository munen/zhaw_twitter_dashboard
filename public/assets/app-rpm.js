var draw_rpm_chart = function(users) {
    var gaugeOptions = {

        chart: {
            type: 'solidgauge'
        },

        title: null,

        pane: {
            center: ['50%', '85%'],
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },

        tooltip: {
            enabled: false
        },

        // the value axis
        yAxis: {
            stops: [
                [0.1, '#55BF3B'], // green
                [0.5, '#DDDF0D'], // yellow
                [0.9, '#DF5353'] // red
            ],
            lineWidth: 0,
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 0,
            title: {
                y: -70
            },
            labels: {
                y: 16
            }
        },

        plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        }
    };

    // The speed gauge
    $('#gauge-1').highcharts(Highcharts.merge(gaugeOptions, {
        yAxis: {
            min: 0,
            max: 200,
            title: {
                text: 'RPM'
            }
        },

        credits: {
            enabled: false
        },

        series: [{
            name: 'RPM',
            data: [0],
            dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                       '<span style="font-size:12px;color:silver">rpm</span></div>'
            },
            tooltip: {
                valueSuffix: ' rpm'
            }
        }]

    }));
};

var update_gauge = function(val) {
    var chart = $('#gauge-1').highcharts(),
        point;

    point = chart.series[0].points[0];
    point.update(val);
};

var show_progress = function(element) {
    var progress_bar_container = $(element).parents(".input-group").parent().find(".progress");
    progress_bar_container.show();

    var progress_bar = $(progress_bar_container.find(".progress-bar"));
    var elapsed_time = 0;
    var intervalID = setInterval(function() {
        progress_bar.css('width', `${++elapsed_time * (100/60)}%`);
        // Stop progress bar after the first minute is over
        if (elapsed_time > 60) {
            progress_bar_container.fadeOut(2000);
            clearInterval(intervalID);
        }
    }, 1000);
};

var start_monitoring_job = function(keyword, id) {
    var settings = {
        "async": true,
        "url": `/keyword_monitor_jobs/${id}`,
        "method": "PUT",
        "headers": {"content-type": "application/json" },
        "data": "{\"keyword\":\"" + keyword + "\"}"
    };

    $.ajax(settings).done(function (response) {
        console.log("Job started");
        $(".alert .message")
            .html("Monitoring job started")
            .parent()
            .fadeTo(2000, 500)
            .slideUp(500, function(){
                $(".alert").hide();
            });
    });
};

var log_tweet = function(msg, id) {
    $(`#gauge-${id} + .well ul`).append($('<li>').html(
        $("<a>")
            .attr("href", `https://twitter.com/${msg.screen_name}/status/${msg.tweet_id}`)
            .html(`${msg.frequency}: `)
            .append($(`<span>${msg.text}</span>`))
    ));
};

var calculate_rpm = function(msg) {
};

var monitor_statistics = function() {
    var client = new Faye.Client('http://localhost:8000/faye');

    client.subscribe('/job_statistics/1', function(msg) {
        log_tweet(msg, 1);
        // TODO: calculate_rpm(msg, id)
    });
    client.subscribe('/job_statistics/2', function(msg) {
        log_tweet(msg, 2);
        // TODO: calculate_rpm(msg, id)
    });
}

$(function () {
    monitor_statistics();
    draw_rpm_chart();

    $(".search-keyword").click(function(event) {
        show_progress(event.target);
        event.preventDefault();
        var val = $(this).parent().find("+input:first").val();
        if(!val) return;
        
        // TODO: Retrieve real ID
        start_monitoring_job(val, 1);
    });
});
