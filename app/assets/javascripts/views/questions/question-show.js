SOC.Views.ShowQuestion = Backbone.CompositeView.extend({
  template: JST['questions/show'],

  initialize: function (options) {
    var that = this;
    this.answers = this.model.answers();   
    this.comments = this.model.comments();
    this.tags = this.model.tags();
    this.listenTo(this.model, 'sync', this.render);
    this.currentUserVote;
    this.currentUserVotes = SOC.currentUser.votes();
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(SOC.currentUser, 'sync', this.render);
    this.listenTo(this.answers, "remove", this.removeAnswer);
    this.editingQuestion = false;
    this.listenTo(this.model, 'revertToCommentFormLink', this.renderCommentFormLink);
    this.listenTo(this.answers, 'commentsRendered', this.renderAnswers);
    this.errors = [];
    // this.listenTo(this.model, 'newCommentCreated', this.renderComments);


    this.delegateEvents();
  },

  events: {
    'click .newCommentLink': 'newComment',
    'click .destroy' : 'deleteQuestion',
    'click .edit' : 'editQuestionForm',
    'click .submitQuestion' : 'submit'
  },


  submit: function(event){
    var that = this;
    event.preventDefault();
    this.model.set({body: that.$('.questionText').val()})
    that.model.save(null, {
      success: function(model, response){
        if(that.editingQuestion){          
          that.editingQuestion = false;
          that.render();
        }
        that.errors = []
      },
      error: function (model, response, opts) {
        that.errors = response.responseJSON;
        that.editingQuestion = true;
        that.render();
        that.renderSubviews();
      }
    })
  },



  render: function () {
    var content = this.template({
      question: this.model,
      editingQuestion: this.editingQuestion,
      errors: this.errors
    });
    if(this.model.escape("body")){
      this.$el.html(content);
      this.renderSubviews();
    }
    this.errors = [];
    return this;
  },
  
  renderSubviews: function(){
    var that = this;
    this.currentUserVote = this.currentUserVotes.select(function (vote) {
        return vote.get("votable_id") === that.model.id;
    })[0]; 

    this.renderVoteCell();
    this.renderAnswerHead();
    this.renderAnswers();
    this.renderNewAnswerForm();
    this.renderComments();
    this.renderCommentFormLink()
  },
  
  deleteQuestion: function(event){
    event.preventDefault();
    this.model.destroy();
    this.remove();
    Backbone.history.navigate("", {trigger: true});
  },

  editQuestionForm: function(event){
    this.editingQuestion = true;
    this.render();
  },

  
  renderVoteCell: function(){
    var that = this;
    var showVoteView = new SOC.Views.ShowVote({
      votable_type: "Question", 
      votable_id: that.model.id,
      author_id: that.model.escape("author_id"),
      currentUserVote: that.currentUserVote, 
      score: that.model.escape("score"),
      question_id: that.model.id,
      superView: this
    });
    this.addSubview(".votecell", showVoteView)
  },


  renderComments: function () {
    this.comments.each(this.addComment.bind(this));
  },
  
  addComment: function (comment) {
    var view = new SOC.Views.CommentNewShowEdit({
      model: comment,
      superView: this,
      creating: false,
      action: "show",
      question_id: this.id
    });
    this.addSubview(".newShowEdit", view);
  },
  
  
  
  newComment: function(event){
    SOC.requireSignedIn();
    event.preventDefault();
    this.removeCommentFormLink();
    var that = this;
    var view = new SOC.Views.CommentNewShowEdit({
      creating: true,
      collection: that.comments,
      model: new SOC.Models.Comment({      
        commentable_type: "Question",
        commentable_id: that.model.id,
      }),
      superView: that,
      action: "new"

    });
    this.addSubview(".newShowEdit", view);
  },

  
  renderCommentFormLink: function(){
    var that = this;
    var new_session_template = "<div class='row'><a href='/session/new?previous_url=questions/" + that.model.id + "' class=' comment col-xs-12'>Sign in to leave comment</a><div style='padding-top: 10px; padding-bottom: 40px;' class=''></div></div>"
    if(SOC.currentUserId){
      this.$(".newComment").html("<div class='row'><a class='comment newCommentLink col-xs-12'>Add comment</a><div style='padding-top: 10px; padding-bottom: 40px;' class=''></div></div>");
    } else{
      this.$(".newComment").html(new_session_template);
    }
  },
  
  removeCommentFormLink: function () {
    this.$(".newComment").empty();
  },
  



  renderAnswers: function () {
    this.answers.each(this.addAnswer.bind(this));

  },

  addAnswer: function (answer) {

    var view = new SOC.Views.ShowAnswer({
      model: answer,
      superView: this,
      collection: this.answers
    });
    this.addSubview("#answers", view);
    this.renderAnswerHead();
  },
  
  renderAnswerHead: function () {
    var $newhead = $("<h2>" + this.model.answers().length + ' Answers' + "</h2>")
    this.$('.answers-subheader').html($newhead)    
  },



  removeAnswer: function (answer) {
    var subview = _.find(
      this.subviews("#answers"),
      function (subview) {
        return subview.model === answer;
      }
    );

    this.removeSubview("#answers", subview);
    var $newhead = $("<h2>" + this.model.answers().length + ' Answers' + "</h2>")
    this.$('.answers-subheader').html($newhead)
    this.renderNewAnswerForm();
  },

  renderNewAnswerForm: function () {
    var a = this.answers.select(function (model) {
        return model.get("author_id") === SOC.currentUser.id;
    });

    if(a.length === 0){
      var answer  = new SOC.Models.Answer()
      var view = new SOC.Views.NewAnswer({
        question: this.model,
        collection: this.answers,
        model: answer,
        superView: this
      });
      this.addSubview("#answer-form", view);
    }
  }

  

})
