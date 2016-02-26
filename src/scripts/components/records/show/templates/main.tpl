<div class="info-message">
  <p>This record has been submitted and cannot be edited within this App.
    Go to the <a href="http://192.171.199.230/irecord7" target="_blank">iRecord website</a> to edit.</p>

</div>
<ul class="table-view core inputs info no-top">
  <li class="table-view-cell species">
    <% if (obj.common_name) { %>
      <span class="media-object pull-right descript"><%- obj.common_name %></span>
    <% } %>
    <span class="media-object pull-right descript"><i><%- obj.scientific_name %></i></span>
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-location"></span>
    <span class="media-object pull-right descript"><%- obj.location_name %></span>
    <span class="media-object pull-right descript"><%- obj.location %></span>
    Location
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-calendar"></span>
    <span class="media-object pull-right descript"><%- obj.date %></span>
    Date
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-number"></span>
    <span class="media-object pull-right descript"><%- obj.number %></span>
    Number
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-stage"></span>
    <span class="media-object pull-right descript"><%- obj.stage %></span>
    Stage
  </li>
  <li class="table-view-cell">
    <span class="media-object pull-left icon icon-comment"></span>
    Comment
    <span class="comment descript"><%- obj.comment %></span>
  </li>
  <li id="img-array">
    <% obj.images.each(function (image){ %>
      <img src="<%- image.attributes.data %>" alt="">
    <% }) %>
  </li>
</ul>