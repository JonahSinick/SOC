class SessionsController < ApplicationController


  def new
    @user = User.new
  end
  
  def create
    @user = User.find_by_email(params[:user][:email])
    if (@user && @user.is_password?(params[:user][:password]))
      sign_in(@user)
    else
      @user = User.new
      flash.now[:errors] = ["Invalid credentials"]
      render :new
    end
  end
  
  def destroy
    sign_out(current_user)
  end

    
end
