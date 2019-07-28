import moment from "moment";

function parse_user(users) {
    if (users && users.length > 0) {
        if (users.length === 1) {
            return users[0];
        }
        if (users.length === 2) {
            return `${users[0]} and ${users[1]}`;
        }
        if (users.length === 3) {
            return `${users[0]} , ${users[1]} and ${users[2]} `;
        }
        if (users.length >= 4) {
            return `${users[0]} , ${users[1]} and ${users.length - 2} others`
        }
    }
}

function formatted_date() {
    let date = new Date();

    let dd = date.getDate();
    let mm = date.getMonth() + 1; //January is 0!

    let yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    let today = yyyy + '-' + mm + '-' + dd;
    return today;
}

function tConv24(time24) {

    let ts = time24;

    const ts_array = ts.split(':');

    if (Array.isArray(ts_array) && ts_array.length > 1) {

        let H = ts_array[0];

        let h = (H % 12) || 12;

        h = (h < 10) ? ("0" + h) : h;  // leading 0 at the left for 1 digit hours

        const ampm = H < 12 ? "AM" : "PM";

        ts = h + ':' + ts_array[1];

        return { time: ts, format: ampm };
    }

    return { time: '', format: '' };
};

const shorten_months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const shorten_days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getEventDate(date) {
    // ensure the date is displayed with today and yesterday
    return moment(date).calendar(null, {
        // when the date is closer, specify custom values
        lastWeek: '[Last] ddd [at] LT',
        lastDay: '[Yesterday at] LT',
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: '[Next] ddd [at] LT',
        sameElse: 'DD/MM/YYYY [at] LT'
    });
}

export {
    parse_user,
    formatted_date,
    tConv24,
    shorten_months,
    shorten_days,
    getEventDate
}