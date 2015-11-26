var draw_rpm_chart = function(users) {
};

var show_progress = function(element) {
    var progress_bar_container = $(element).parents(".input-group").parent().find(".progress");
    progress_bar_container.show();

    var progress_bar = $(progress_bar_container.find(".progress-bar"));
    var elapsed_time = 0;
    var intervalID = setInterval(function() {
        progress_bar.css('width', `${++elapsed_time * (100/60)}%`);
        // Stop progress bar when done
        if (elapsed_time > 3) {
            progress_bar_container.fadeOut(2000);
            clearInterval(intervalID);
        }
    }, 1000);
};

var start_monitoring_job = function(keyword) {

    var settings = {
        "async": true,
        "url": "/keyword_monitor_jobs/1",
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

var monitor_statistics = function() {
    var client = new Faye.Client('http://localhost:8000/faye');

    client.subscribe('/job_statistics', function(msg) {
        $(".well ul").append($('<li>').html(
            $("<a>")
                .attr("href", `https://twitter.com/${msg.screen_name}/status/${msg.tweet_id}`)
                .html(`${msg.frequency}: `)
                .append($(`<span>${msg.text}</span>`))
        ));
    });
}

$(function () {
    monitor_statistics();

    $(".search-keyword").click(function(event) {
        show_progress(event.target);
        event.preventDefault();
        var val = $(this).parent().find("+input:first").val();
        if(!val) return;
        
        start_monitoring_job(val);
    });
});
