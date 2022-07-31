$(document).ready(()=> {
    $('#submit').attr('disabled', true);
    $('#email').on('keyup', validateEmail);
    $('#password').on('keyup', validatePassword);

    $('input').on('keyup', validateSubmit);

    function validateEmail() {
        function badEmail(email) {
              return !/\S*@\S*\.\S*/.test(email);
        }
    
        var val = $('#email').val();
        var flag = true;
        
        if (val === '') {
          $('#email-status').html("Email can't be blank &#10060;");
        } else if (badEmail(val)) {
          $('#email-status').html("Please enter a valid email &#10060;");
        } else {
          flag = false;
        }
        
        if (flag) {
          $('#email-status').addClass('invalid');
          $('#email-status').addClass('text-danger')
        } else {
            
          $('#email-status').removeClass('invalid').html('OK &#x2705;');
          $('#email-status').removeClass('text-danger').addClass('text-success')
        }
      }

      function validatePassword() {
        var val = $('#password').val();
        var flag = true;
        
        if (val === '') {
          $('#password-status').html("Password can't be blank &#10060;");
        } else if (/\s/.test(val)) {
          $('#password-status').html("Password can't contain whitespace &#10060;");
        } else if (!/\d/.test(val)) {
          $('#password-status').html("Password must contain at least one digit &#10060;");
        } else if (!/[A-Z]/.test(val)) {
          $('#password-status').html("Password must contain at least one uppercase letter &#10060;");
        } else if (val.length < 6 || val.length > 32) {
          $('#password-status').html("Password length must be between 6 and 32 characters &#10060;");
        } else {
          flag = false;
        }
        
        if (flag) {
          $('#password-status').addClass('invalid');
          $('#password-status').addClass('text-danger')
        } else {
          $('#password-status').removeClass('invalid').html("OK &#x2705;");
          $('#password-status').removeClass('text-danger').addClass('text-success')
        }
      }


  function validateSubmit() {
    $('#submit').attr('disabled', ( $('.invalid').length > 0 ? true : false) );
  }

})