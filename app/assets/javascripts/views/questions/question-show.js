SOC.Views.ShowQuestion = Backbone.CompositeView.extend({
  template: JST['questions/show'],

  initialize: function (options) {
    that = this
    this.answers = this.model.answers();   
    this.comments = this.model.comments();
    this.votes = this.model.votes();
    this.commentFormLinkedClicked = false;
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.answers, 'create', this.addAnswer);
    this.listenTo(this.comments, 'add', this.addComment);
    this.listenTo(this.answers, 'commentsRendered', this.renderAnswers);
  },
  
  events: {
    'click #new-question-comment-link': 'renderNewCommentForm',
    'click .question-destroy' : 'deleteQuestion'
  },
  

  render: function () {
    console.log("rendering!")
    var content = this.template({
      question: this.model
    });
    this.$el.html(content);
    this.renderAnswers();
    this.renderNewAnswerForm();
    this.renderComments();
    if(this.commentFormLinkedClicked === false){
      this.renderCommentFormLink();
    };
    this.renderVoteCell();
    return this;
    
  },
  
  deleteQuestion: function(){
    this.model.destroy(),
    this.remove()
    Backbone.history.navigate("", {trigger:true})    
  },
  
  renderVoteCell: function(){
    var vote  = new SOC.Models.Vote({votable_type: "Question", votable_id: this.model.id});

    var showVoteView = new SOC.Views.ShowVote({
      model: vote
    });
    this.addSubview("#votecell", showVoteView);
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
    var $newhead = $("<h2>" + this.model.answers().length + ' Answers' + "</h2>")
    this.$('.answers-subheader').html($newhead)
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
  },
  
  
  renderComments: function () {
    this.comments.each(this.addComment.bind(this));
  },
  
  addComment: function (comment) {
    var view = new SOC.Views.ShowComment({
      model: comment
    });
    this.addSubview("#question-comments", view);
  },

  renderCommentFormLink: function () {
    var template = "<a id='new-question-comment-link'>Add comment</a>";
    var view = new Backbone.CompositeView();
    view.$el.append(template)
    this.addSubview("#question-commment-form", view);
  },


  
  renderNewCommentForm: function () {
    this.commentFormLinkedClicked = true
    this.$("#question-commment-form").empty()
    var comment  = new SOC.Models.Comment()
    var view = new SOC.Views.NewComment({
      collection: this.comments,
      model: comment,
      superView: this,
      commentable_type: "Question",
      commentable_id: this.model.id,
      question_id: this.model.id
    });
    this.addSubview("#question-commment-form", view);
  }


});