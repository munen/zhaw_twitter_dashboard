var draw_follower_chart = function(users) {
    $('#container').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Twitter follower count'
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'user name'
        },
        yAxis: {
            title: {
                text: 'Total follower count'
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {enabled: true}
            }
        },

        series: [{
            name: 'Followers',
            colorByPoint: true,
            data: [{
                name: users[0].name,
                y: users[0].count
            }, {
                name: users[1].name,
                y: users[1].count
            }, {
                name: users[2].name,
                y: users[2].count
            }]
        }]
    });
};

var get_follower_count = function(screen_name, callback) {
    jQuery.getJSON("/twitter_users/" + screen_name, function(data) {
        callback(data);
    });
};

var read_screen_names = function() {
    var screen_names = [];
    $(".screen-names input").map(function(index, element) {
        screen_names.push($(element).val());
    });
    return screen_names;
}

$(function () {
    $("#get-followers").click(function(event) {
        event.preventDefault();

        // Make sure there's always three users available even if they don't hold data
        var users = [{ name: "",
                       count: 0 },
                     { name: "",
                       count: 0 },
                     { name: "",
                       count: 0 }];
        var screen_names = read_screen_names();

        screen_names.map(function(screen_name) {
            get_follower_count(screen_name, function(user) {
                // Inject the new user at the beginning
                users.splice(0, 0, { name: user.screen_name, count: user.followers_count });
                draw_follower_chart(users);
            });
        });
    });
});
