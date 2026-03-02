$(document).ready(function() {
    $('#upload-form').on('submit', function(e) {
        e.preventDefault();

        // Show the spinning SVG
        $('#loading-svg').show();
        $('#result').empty();

        $.ajax({
            url: '/upload',
            type: 'post',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(data) {
                // Hide the spinning SVG
                $('#loading-svg').hide();

                // Build the result input safely using DOM methods
                var input = $('<input>', {
                    id: 'upload-url',
                    type: 'text',
                    class: 'form-control',
                    readonly: true,
                    value: data.url
                }).on('click', function() {
                    this.select();
                    document.execCommand('copy');
                });

                $('#result').hide().empty().append(input).fadeIn();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // Hide the spinning SVG
                $('#loading-svg').hide();

                var errMsg = jqXHR.responseText || errorThrown;
                $('#result').text('Error: ' + errMsg);
            }
        });
    });
});
